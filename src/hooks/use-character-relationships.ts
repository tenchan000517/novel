import { useState, useEffect, useCallback } from 'react';
import { Character, RelationshipType } from '@/types/characters';

export interface RelationshipNode {
  id: string;
  name: string;
  type: string;
  group: number;
  size: number;
  color: string;
}

export interface RelationshipLink {
  source: string;
  target: string;
  type: RelationshipType;
  strength: number;
  description: string;
  id: string;
}

export interface RelationshipCluster {
  id: string;
  name: string;
  members: string[];
  dominantRelation: RelationshipType;
  cohesion: number;
}

export interface RelationshipTension {
  characters: string[];
  type: RelationshipType;
  intensity: number;
  description: string;
}

export interface RelationshipChange {
  source: string;
  target: string;
  fromType: RelationshipType;
  toType: RelationshipType;
  fromStrength: number;
  toStrength: number;
  timestamp: Date;
  chapter?: number;
}

export interface CharacterRelationshipData {
  nodes: RelationshipNode[];
  links: RelationshipLink[];
  clusters: RelationshipCluster[];
  tensions: RelationshipTension[];
  changes: RelationshipChange[];
  metrics: {
    totalRelationships: number;
    averageStrength: number;
    strongestRelationship: {
      source: string;
      target: string;
      type: RelationshipType;
      strength: number;
    } | null;
    mostConnectedCharacter: {
      id: string;
      name: string;
      connectionCount: number;
    } | null;
  };
}

interface UseCharacterRelationshipsProps {
  characterId?: string;
  relationType?: RelationshipType;
  includeInactive?: boolean;
  refreshInterval?: number | null;
}

// Color mapping for relationship types
const RELATIONSHIP_COLORS: Record<string, string> = {
  FRIEND: '#4ADE80',     // Green
  ENEMY: '#F87171',      // Red
  LOVER: '#FB7185',      // Pink
  PARENT: '#60A5FA',     // Blue
  CHILD: '#93C5FD',      // Light Blue
  MENTOR: '#A78BFA',     // Purple
  STUDENT: '#C4B5FD',    // Light Purple
  RIVAL: '#FB923C',      // Orange
  COLLEAGUE: '#FBBF24',  // Yellow
  NEUTRAL: '#94A3B8',    // Gray
  PROTECTOR: '#38BDF8',  // Sky Blue
  PROTECTED: '#7DD3FC',  // Light Sky Blue
  LEADER: '#818CF8',     // Indigo
  FOLLOWER: '#A5B4FC',   // Light Indigo
};

// Color mapping for character types
const CHARACTER_TYPE_COLORS: Record<string, string> = {
  MAIN: '#4F46E5',      // Indigo
  SUB: '#EC4899',       // Pink
  MOB: '#6B7280',       // Gray
};

// Group mappings for character types (for visualization)
const CHARACTER_TYPE_GROUPS: Record<string, number> = {
  MAIN: 1,
  SUB: 2,
  MOB: 3,
};

/**
 * Custom hook for managing character relationship data and operations
 * Provides data for relationship visualization, analysis, and updates
 */
export const useCharacterRelationships = ({
  characterId,
  relationType,
  includeInactive = false,
  refreshInterval = null,
}: UseCharacterRelationshipsProps = {}) => {
  const [data, setData] = useState<CharacterRelationshipData>({
    nodes: [],
    links: [],
    clusters: [],
    tensions: [],
    changes: [],
    metrics: {
      totalRelationships: 0,
      averageStrength: 0,
      strongestRelationship: null,
      mostConnectedCharacter: null,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allCharacters, setAllCharacters] = useState<Character[]>([]);

  // Fetch relationship data from the API
  const fetchRelationships = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Build the URL with query parameters
      const queryParams = new URLSearchParams();
      if (characterId) {
        queryParams.append('characterId', characterId);
      }
      if (relationType) {
        queryParams.append('type', relationType);
      }
      if (includeInactive !== undefined) {
        queryParams.append('includeInactive', String(includeInactive));
      }

      // Fetch relationship data
      const relationshipsResponse = await fetch(`/api/characters/relationships?${queryParams.toString()}`);

      if (!relationshipsResponse.ok) {
        throw new Error(`Failed to fetch relationships: ${relationshipsResponse.status}`);
      }

      const relationshipsResult = await relationshipsResponse.json();

      if (!relationshipsResult.success) {
        throw new Error(relationshipsResult.error?.message || 'Failed to fetch relationships');
      }

      // Fetch all characters for reference
      const charactersResponse = await fetch('/api/characters');

      if (!charactersResponse.ok) {
        throw new Error(`Failed to fetch characters: ${charactersResponse.status}`);
      }

      const charactersResult = await charactersResponse.json();

      if (!charactersResult.success) {
        throw new Error(charactersResult.error?.message || 'Failed to fetch characters');
      }

      // Store all characters for reference
      const characters = charactersResult.data.characters;
      setAllCharacters(characters);

      // Process the raw data into a format suitable for visualization and analysis
      const processedData = processRelationshipData(
        relationshipsResult.data,
        characters
      );

      setData(processedData);
    } catch (error) {
      console.error('Failed to fetch relationship data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [characterId, relationType, includeInactive]);

  // Process raw relationship data into a structured format
  const processRelationshipData = (rawData: any, characters: Character[]): CharacterRelationshipData => {
    // Create a map for quick character lookups
    const characterMap = new Map<string, Character>();
    characters.forEach(char => characterMap.set(char.id, char));

    // Process nodes (characters)
    const nodes: RelationshipNode[] = rawData.nodes.map((node: any) => {
      const character = characterMap.get(node.id);
      return {
        id: node.id,
        name: character?.name || `Unknown (${node.id})`,
        type: character?.type || 'UNKNOWN',
        group: CHARACTER_TYPE_GROUPS[character?.type || 'MOB'] || 3,
        size: node.connections || 1,
        color: CHARACTER_TYPE_COLORS[character?.type || 'MOB'] || '#6B7280',
      };
    });

    // Process links (relationships)
    const links: RelationshipLink[] = rawData.edges.map((edge: any, index: number) => {
      const sourceChar = characterMap.get(edge.source);
      const targetChar = characterMap.get(edge.target);
      return {
        source: edge.source,
        target: edge.target,
        type: edge.type as RelationshipType,
        strength: edge.strength || 0.5,
        description: edge.description || `${sourceChar?.name} and ${targetChar?.name} relationship`,
        id: `link-${index}`,
      };
    });

    // Process clusters
    const clusters: RelationshipCluster[] = (rawData.clusters || []).map((cluster: any) => {
      const memberNames = cluster.members
        .map((id: string) => characterMap.get(id)?.name || id)
        .filter(Boolean);
      
      return {
        id: cluster.id,
        name: `Cluster: ${memberNames[0]} group`,
        members: cluster.members,
        dominantRelation: cluster.dominantRelation,
        cohesion: cluster.cohesion,
      };
    });

    // Process tensions
    const tensions: RelationshipTension[] = (rawData.tensions || []).map((tension: any) => {
      return {
        characters: tension.characters,
        type: tension.type as RelationshipType,
        intensity: tension.intensity,
        description: tension.description,
      };
    });

    // Process historical changes (if available)
    const changes: RelationshipChange[] = (rawData.developments || []).map((dev: any) => {
      return {
        source: dev.characters[0],
        target: dev.characters[1],
        fromType: dev.from.type as RelationshipType,
        toType: dev.to.type as RelationshipType,
        fromStrength: dev.from.strength,
        toStrength: dev.to.strength,
        timestamp: new Date(dev.timestamp),
        chapter: dev.chapter,
      };
    });

    // Calculate metrics
    const totalRelationships = links.length;
    const totalStrength = links.reduce((sum, link) => sum + link.strength, 0);
    const averageStrength = totalRelationships > 0 ? totalStrength / totalRelationships : 0;

    // Find strongest relationship
    let strongestRelationship = null;
    if (links.length > 0) {
      const strongest = links.reduce((prev, current) => 
        prev.strength > current.strength ? prev : current
      );
      
      strongestRelationship = {
        source: strongest.source,
        target: strongest.target,
        type: strongest.type,
        strength: strongest.strength,
      };
    }

    // Find most connected character
    let mostConnectedCharacter = null;
    if (nodes.length > 0) {
      const mostConnected = nodes.reduce((prev, current) => 
        prev.size > current.size ? prev : current
      );
      
      mostConnectedCharacter = {
        id: mostConnected.id,
        name: mostConnected.name,
        connectionCount: mostConnected.size,
      };
    }

    // Final structure
    return {
      nodes,
      links,
      clusters,
      tensions,
      changes,
      metrics: {
        totalRelationships,
        averageStrength,
        strongestRelationship,
        mostConnectedCharacter,
      },
    };
  };

  // Update a relationship between two characters
  const updateRelationship = async (
    sourceId: string,
    targetId: string,
    type: RelationshipType,
    strength: number,
    description?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/characters/relationships/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceId,
          targetId,
          type,
          strength,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update relationship: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to update relationship');
      }

      // Refresh data after update
      fetchRelationships();
      return true;
    } catch (error) {
      console.error('Failed to update relationship:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      return false;
    }
  };

  // Get relationships for a specific character
  const getCharacterRelationships = (id: string): RelationshipLink[] => {
    return data.links.filter(link => 
      link.source === id || link.target === id
    );
  };

  // Get relationship between two specific characters
  const getRelationshipBetween = (sourceId: string, targetId: string): RelationshipLink | undefined => {
    return data.links.find(link => 
      (link.source === sourceId && link.target === targetId) ||
      (link.source === targetId && link.target === sourceId)
    );
  };

  // Find characters with a specific relationship type
  const findRelationshipsByType = (type: RelationshipType): RelationshipLink[] => {
    return data.links.filter(link => link.type === type);
  };

  // Find all tense relationships (high intensity)
  const findTenseRelationships = (minIntensity: number = 0.7): RelationshipLink[] => {
    return data.links.filter(link => 
      (link.type === 'ENEMY' || link.type === 'RIVAL') && 
      link.strength >= minIntensity
    );
  };

  // Find characters that belong to the same cluster
  const getCharactersInCluster = (clusterId: string): RelationshipNode[] => {
    const cluster = data.clusters.find(c => c.id === clusterId);
    if (!cluster) return [];
    
    return data.nodes.filter(node => cluster.members.includes(node.id));
  };

  // Find character tensions (conflicts)
  const getCharacterTensions = (characterId: string): RelationshipTension[] => {
    return data.tensions.filter(tension => 
      tension.characters.includes(characterId)
    );
  };

  // Get relationships that have changed in the past
  const getRelationshipChanges = (
    sourceId?: string, 
    targetId?: string
  ): RelationshipChange[] => {
    let filteredChanges = data.changes;
    
    if (sourceId) {
      filteredChanges = filteredChanges.filter(change => 
        change.source === sourceId || change.target === sourceId
      );
    }
    
    if (targetId) {
      filteredChanges = filteredChanges.filter(change => 
        change.source === targetId || change.target === targetId
      );
    }
    
    return filteredChanges.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  // Get character details by ID
  const getCharacterDetails = (id: string): Character | undefined => {
    return allCharacters.find(char => char.id === id);
  };

  // Calculate relationship strength score for a character (average of all relationships)
  const calculateRelationshipStrength = (characterId: string): number => {
    const relationships = getCharacterRelationships(characterId);
    if (relationships.length === 0) return 0;
    
    const totalStrength = relationships.reduce((sum, rel) => sum + rel.strength, 0);
    return totalStrength / relationships.length;
  };

  // Set up periodic refresh if interval is provided
  useEffect(() => {
    fetchRelationships();
    
    if (refreshInterval) {
      const interval = setInterval(fetchRelationships, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchRelationships, refreshInterval]);

  // Return relationship data and utility functions
  return {
    data,
    isLoading,
    error,
    refresh: fetchRelationships,
    updateRelationship,
    getCharacterRelationships,
    getRelationshipBetween,
    findRelationshipsByType,
    findTenseRelationships,
    getCharactersInCluster,
    getCharacterTensions,
    getRelationshipChanges,
    getCharacterDetails,
    calculateRelationshipStrength,
    
    // Helper function to get color for relationship type
    getRelationshipColor: (type: RelationshipType): string => 
      RELATIONSHIP_COLORS[type] || '#94A3B8',
      
    // Helper function to get human-readable relationship label
    getRelationshipLabel: (type: RelationshipType): string => {
      const labels: Record<RelationshipType, string> = {
        FRIEND: '友人',
        ENEMY: '敵対者',
        LOVER: '恋愛関係',
        PARENT: '親',
        CHILD: '子',
        MENTOR: '指導者',  // 「師匠」より一般的
        STUDENT: '指導対象', // 「弟子」より一般的
        RIVAL: 'ライバル',
        COLLEAGUE: '同僚',
        NEUTRAL: '中立',
        PROTECTOR: '保護者',  // 「守護者」より現代的
        PROTECTED: '被保護者',
        LEADER: 'リーダー',
        FOLLOWER: 'フォロワー',  // 「従者」より現代的
      };
      return labels[type] || type;
    }
  };
};