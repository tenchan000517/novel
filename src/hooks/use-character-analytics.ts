import { useState, useEffect, useCallback } from 'react';
import { Character } from '@/types/characters';

export interface AppearanceData {
  name: string;
  count: number;
  color: string;
}

export interface CharacterDevelopmentData {
  category: string;
  value: number;
}

export interface CharacterInteractionData {
  source: string;
  target: string;
  strength: number;
  type: string;
}

export interface CharacterDetailData {
  id: string;
  name: string;
  type: string;
  color?: string;
  emotionalState: string;
  lastAppearance: number;
  appearanceCount: number;
  relatedCharacters: number;
  development: CharacterDevelopmentData[];
}

export interface CharacterAnalyticsData {
  appearances: AppearanceData[];
  interactions: CharacterInteractionData[];
  development: any[];
}

interface UseCharacterAnalyticsProps {
  timeRange?: 'recent' | 'all';
  characterType?: 'MAIN' | 'SUB' | 'MOB' | 'ALL';
  refreshInterval?: number | null;
}

// Color palette for different character types
const COLOR_PALETTE = {
  MAIN: ['#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF', '#1E3A8A'],
  SUB: ['#EC4899', '#DB2777', '#BE185D', '#9D174D', '#831843'],
  MOB: ['#10B981', '#059669', '#047857', '#065F46', '#064E3B'],
  OTHER: ['#6B7280', '#4B5563', '#374151', '#1F2937', '#111827'],
};

/**
 * Custom hook for fetching and analyzing character statistics
 * Provides appearance frequency, interaction data, and development metrics
 */
export const useCharacterAnalytics = ({
  timeRange = 'all',
  characterType = 'ALL',
  refreshInterval = null,
}: UseCharacterAnalyticsProps = {}) => {
  const [data, setData] = useState<CharacterAnalyticsData>({
    appearances: [],
    interactions: [],
    development: []
  });
  
  const [characterData, setCharacterData] = useState<CharacterDetailData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch character analytics data from API
  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch all characters first
      const charactersResponse = await fetch('/api/characters');
      
      if (!charactersResponse.ok) {
        throw new Error(`Failed to fetch characters: ${charactersResponse.status}`);
      }
      
      const charactersResult = await charactersResponse.json();
      
      if (!charactersResult.success) {
        throw new Error(charactersResult.error?.message || 'Failed to fetch characters');
      }
      
      const allCharacters: Character[] = charactersResult.data.characters;
      
      // Filter characters by type if specified
      const filteredCharacters = characterType === 'ALL' 
        ? allCharacters 
        : allCharacters.filter(char => char.type === characterType);
      
      // Fetch relationship data
      const relationshipsResponse = await fetch('/api/characters/relationships');
      
      if (!relationshipsResponse.ok) {
        throw new Error(`Failed to fetch relationships: ${relationshipsResponse.status}`);
      }
      
      const relationshipsResult = await relationshipsResponse.json();
      
      // Calculate appearance data
      const appearanceData: AppearanceData[] = processAppearanceData(filteredCharacters, timeRange);
      
      // Process interaction data
      const interactionData = processInteractionData(
        relationshipsResult.data.edges,
        filteredCharacters
      );
      
      // Process character development data
      const developmentData = processDevelopmentData(filteredCharacters);
      
      // Create detailed character data
      const detailedCharacterData = createDetailedCharacterData(filteredCharacters);
      
      // Set the data
      setData({
        appearances: appearanceData,
        interactions: interactionData,
        development: developmentData
      });
      
      setCharacterData(detailedCharacterData);
    } catch (error) {
      console.error('Failed to fetch character analytics:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [timeRange, characterType]);
  
  // Process character appearance data
  const processAppearanceData = (characters: Character[], timeRange: string): AppearanceData[] => {
    const appearanceMap = new Map<string, number>();
    const colorMap = new Map<string, string>();
    let otherCount = 0;
    
    // Process each character's appearances
    characters.forEach((character, index) => {
      let appearances = character.history.appearances;
      
      // Filter by time range if needed
      if (timeRange === 'recent') {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
        appearances = appearances.filter(app => new Date(app.timestamp) >= thirtyDaysAgo);
      }
      
      const count = appearances.length;
      
      // Main characters get individual entries, others get grouped
      if (character.type === 'MAIN' || (character.type === 'SUB' && count > 10)) {
        appearanceMap.set(character.name, count);
        
        // Assign consistent colors based on character type
        const colorIndex = index % COLOR_PALETTE[character.type].length;
        colorMap.set(character.name, COLOR_PALETTE[character.type][colorIndex]);
      } else {
        otherCount += count;
      }
    });
    
    // Create appearance data array
    const appearanceData: AppearanceData[] = [];
    
    appearanceMap.forEach((count, name) => {
      appearanceData.push({
        name,
        count,
        color: colorMap.get(name) || '#6B7280'
      });
    });
    
    // Add "Other" category if there are other characters
    if (otherCount > 0) {
      appearanceData.push({
        name: 'その他',
        count: otherCount,
        color: '#6B7280'
      });
    }
    
    // Sort by count descending
    return appearanceData.sort((a, b) => b.count - a.count);
  };
  
  // Process character interaction data
  const processInteractionData = (relationships: any[], characters: Character[]): CharacterInteractionData[] => {
    // Create a map for quick character lookups
    const characterMap = new Map<string, Character>();
    characters.forEach(char => characterMap.set(char.id, char));
    
    return relationships
      .filter(rel => {
        // Filter relationships to only include characters we care about
        const sourceChar = characterMap.get(rel.source);
        const targetChar = characterMap.get(rel.target);
        return sourceChar && targetChar;
      })
      .map(rel => {
        const sourceChar = characterMap.get(rel.source)!;
        const targetChar = characterMap.get(rel.target)!;
        
        return {
          source: sourceChar.name,
          target: targetChar.name,
          strength: rel.strength,
          type: rel.type
        };
      });
  };
  
  // Process character development data
  const processDevelopmentData = (characters: Character[]) => {
    // For now, return a simple structure
    // This could be expanded based on specific requirements
    return characters
      .filter(char => char.type === 'MAIN' || char.type === 'SUB')
      .map(char => ({
        id: char.id,
        name: char.name,
        developmentStage: char.state.developmentStage || 0,
        developmentPath: char.history.developmentPath.map(milestone => ({
          stage: milestone.stage,
          description: milestone.description,
          chapter: milestone.chapterNumber,
          date: milestone.achievedAt
        }))
      }));
  };
  
  // Create detailed character data
  const createDetailedCharacterData = (characters: Character[]): CharacterDetailData[] => {
    return characters
      .filter(char => char.type === 'MAIN' || char.type === 'SUB')
      .map((char, index) => {
        // Determine color based on character type
        const colorIndex = index % COLOR_PALETTE[char.type].length;
        const color = COLOR_PALETTE[char.type][colorIndex];
        
        // Calculate related characters count
        const relatedCharacters = char.relationships?.length || 0;
        
        // Create development data
        const development: CharacterDevelopmentData[] = [
          { category: '性格', value: calculatePersonalityDevelopment(char) },
          { category: '能力', value: calculateSkillDevelopment(char) },
          { category: '関係性', value: calculateRelationshipDevelopment(char) },
          { category: '背景', value: calculateBackgroundDevelopment(char) }
        ];
        
        return {
          id: char.id,
          name: char.name,
          type: char.type,
          color,
          emotionalState: char.state.emotionalState,
          lastAppearance: char.state.lastAppearance || 0,
          appearanceCount: char.history.appearances.length,
          relatedCharacters,
          development
        };
      });
  };
  
  // Helper functions to calculate different aspects of character development
  
  const calculatePersonalityDevelopment = (character: Character): number => {
    // Complexity of personality traits
    const traitComplexity = character.personality?.traits?.length || 0;
    const developmentStage = character.state.developmentStage || 0;
    
    // More traits and higher development stage means more personality development
    return Math.min(100, (traitComplexity * 10) + (developmentStage * 15));
  };
  
  const calculateSkillDevelopment = (character: Character): number => {
    // Look at character history for skill development events
    const skillEvents = character.history.developmentPath.filter(
      milestone => milestone.description.includes('能力') || milestone.description.includes('スキル')
    );
    
    return Math.min(100, skillEvents.length * 20 + 50);
  };
  
  const calculateRelationshipDevelopment = (character: Character): number => {
    // Number and strength of relationships
    const relationshipCount = character.relationships?.length || 0;
    const relationshipStrength = character.relationships?.reduce(
      (sum, rel) => sum + rel.strength, 0
    ) || 0;
    
    return Math.min(100, (relationshipCount * 8) + (relationshipStrength * 10));
  };
  
  const calculateBackgroundDevelopment = (character: Character): number => {
    // Check backstory complexity
    const hasDetailedHistory = character.backstory?.detailedHistory ? 40 : 0;
    const hasMotivations = character.backstory?.motivations ? 20 : 0;
    const hasSecrets = character.backstory?.secrets ? 20 : 0;
    const eventCount = (character.backstory?.significantEvents?.length || 0) * 5;
    
    return Math.min(100, hasDetailedHistory + hasMotivations + hasSecrets + eventCount);
  };
  
  // Set up periodic refresh if interval is provided
  useEffect(() => {
    fetchAnalytics();
    
    if (refreshInterval) {
      const interval = setInterval(fetchAnalytics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchAnalytics, refreshInterval]);
  
  // Additional analytics methods
  
  const getMostActiveCharacters = (limit: number = 5): CharacterDetailData[] => {
    return [...characterData]
      .sort((a, b) => b.appearanceCount - a.appearanceCount)
      .slice(0, limit);
  };
  
  const getMostConnectedCharacters = (limit: number = 5): CharacterDetailData[] => {
    return [...characterData]
      .sort((a, b) => b.relatedCharacters - a.relatedCharacters)
      .slice(0, limit);
  };
  
  const getCharactersByDevelopmentStage = (stage: number): CharacterDetailData[] => {
    return characterData.filter(char => {
      const developmentStage = characterData.find(c => c.id === char.id)?.development[0]?.value || 0;
      return Math.floor(developmentStage / 20) === stage;
    });
  };
  
  const getCharacterByName = (name: string): CharacterDetailData | undefined => {
    return characterData.find(char => char.name === name);
  };
  
  const getCharacterById = (id: string): CharacterDetailData | undefined => {
    return characterData.find(char => char.id === id);
  };
  
  const getInteractionsByCharacter = (characterId: string): CharacterInteractionData[] => {
    const character = characterData.find(char => char.id === characterId);
    if (!character) return [];
    
    return data.interactions.filter(
      interaction => interaction.source === character.name || interaction.target === character.name
    );
  };
  
  // Return analytics data and utility functions
  return {
    data,
    characterData,
    isLoading,
    error,
    refresh: fetchAnalytics,
    getMostActiveCharacters,
    getMostConnectedCharacters,
    getCharactersByDevelopmentStage,
    getCharacterByName,
    getCharacterById,
    getInteractionsByCharacter
  };
};