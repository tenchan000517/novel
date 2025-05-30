import { useState, useEffect, useCallback } from 'react';
import { Character, CharacterType } from '@/types/characters';

interface UseCharactersParams {
  type?: CharacterType;
  status?: 'active' | 'inactive';
  page?: number;
  limit?: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

/**
 * カスタムフック: キャラクター一覧の取得と操作
 * 
 * キャラクターリストの取得、作成、更新、非アクティブ化、昇格などの
 * 機能を提供します。API通信と状態管理を担当します。
 */
export const useCharacters = (params: UseCharactersParams = {}) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: params.page || 1,
    limit: params.limit || 20,
    total: 0,
    pages: 0
  });

  /**
   * キャラクター一覧を取得する
   */
  const fetchCharacters = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // クエリパラメーターの構築
      const queryParams = new URLSearchParams();
      if (params.type) queryParams.append('type', params.type);
      if (params.status) queryParams.append('status', params.status);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      
      // API リクエスト
      const response = await fetch(`/api/characters?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`キャラクター取得に失敗しました: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'キャラクター取得に失敗しました');
      }
      
      setCharacters(result.data.characters);
      setPagination(result.data.pagination);
    } catch (error) {
      console.error('キャラクター取得エラー:', error);
      setError(error instanceof Error ? error.message : '不明なエラーが発生しました');
      setCharacters([]);
    } finally {
      setIsLoading(false);
    }
  }, [params.type, params.status, params.page, params.limit]);

  /**
   * 新しいキャラクターを作成する
   */
  const createCharacter = async (characterData: Partial<Character>): Promise<Character | null> => {
    try {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(characterData),
      });
      
      if (!response.ok) {
        throw new Error(`キャラクター作成に失敗しました: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'キャラクター作成に失敗しました');
      }
      
      // リストを更新
      fetchCharacters();
      
      return result.data.character;
    } catch (error) {
      console.error('キャラクター作成エラー:', error);
      return null;
    }
  };

  /**
   * キャラクターを更新する
   */
  const updateCharacter = async (id: string, updates: Partial<Character>): Promise<Character | null> => {
    try {
      const response = await fetch(`/api/characters/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`キャラクター更新に失敗しました: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'キャラクター更新に失敗しました');
      }
      
      // ローカル状態を更新
      setCharacters(prev => 
        prev.map(char => char.id === id ? result.data.character : char)
      );
      
      return result.data.character;
    } catch (error) {
      console.error('キャラクター更新エラー:', error);
      return null;
    }
  };

  /**
   * キャラクターを非アクティブにする（論理削除）
   */
  const deactivateCharacter = async (id: string): Promise<Character | null> => {
    try {
      const response = await fetch(`/api/characters/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`キャラクター非アクティブ化に失敗しました: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'キャラクター非アクティブ化に失敗しました');
      }
      
      // ローカル状態を更新
      setCharacters(prev => 
        prev.map(char => char.id === id ? { ...char, state: { ...char.state, isActive: false } } : char)
      );
      
      return result.data.character;
    } catch (error) {
      console.error('キャラクター非アクティブ化エラー:', error);
      return null;
    }
  };

  /**
   * キャラクターを昇格する
   */
  const promoteCharacter = async (id: string): Promise<Character | null> => {
    try {
      const response = await fetch('/api/characters/promotion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ characterId: id }),
      });
      
      if (!response.ok) {
        throw new Error(`キャラクター昇格に失敗しました: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'キャラクター昇格に失敗しました');
      }
      
      // ローカル状態を更新
      setCharacters(prev => 
        prev.map(char => char.id === id ? result.data.character : char)
      );
      
      return result.data.character;
    } catch (error) {
      console.error('キャラクター昇格エラー:', error);
      return null;
    }
  };

  /**
   * キャラクターの関係性を取得する
   */
  const getCharacterRelationships = async (characterId: string): Promise<any | null> => {
    try {
      const response = await fetch(`/api/characters/relationships?characterId=${characterId}`);
      
      if (!response.ok) {
        throw new Error(`キャラクター関係性取得に失敗しました: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'キャラクター関係性取得に失敗しました');
      }
      
      return result.data;
    } catch (error) {
      console.error('キャラクター関係性取得エラー:', error);
      return null;
    }
  };

  /**
   * キャラクター登場タイミングの推奨を取得する
   */
  const getAppearanceTiming = async (characterId: string, storyContext: any): Promise<any | null> => {
    try {
      const response = await fetch(`/api/characters/timing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ characterId, storyContext }),
      });
      
      if (!response.ok) {
        throw new Error(`登場タイミング取得に失敗しました: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || '登場タイミング取得に失敗しました');
      }
      
      return result.data;
    } catch (error) {
      console.error('登場タイミング取得エラー:', error);
      return null;
    }
  };

  // 初期ロードとパラメータ変更時の再取得
  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  return {
    characters,
    isLoading,
    error,
    pagination,
    refetch: fetchCharacters,
    createCharacter,
    updateCharacter,
    deactivateCharacter,
    promoteCharacter,
    getCharacterRelationships,
    getAppearanceTiming
  };
};

/**
 * カスタムフック: 単一キャラクターの取得と操作
 * 
 * 1人のキャラクターの詳細情報取得、更新、発展経路取得など
 * 単一キャラクターに対する操作を提供します。
 */
export const useCharacter = (id: string) => {
  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relationships, setRelationships] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);

  /**
   * キャラクター詳細を取得する
   */
  const fetchCharacter = useCallback(async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/characters/${id}`);
      
      if (!response.ok) {
        throw new Error(`キャラクター取得に失敗しました: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'キャラクター取得に失敗しました');
      }
      
      setCharacter(result.data.character);
      setRelationships(result.data.relationships || null);
      setMetrics(result.data.metrics || null);
    } catch (error) {
      console.error(`キャラクター取得エラー ${id}:`, error);
      setError(error instanceof Error ? error.message : '不明なエラーが発生しました');
      setCharacter(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  /**
   * キャラクターを更新する
   */
  const updateCharacter = async (updates: Partial<Character>): Promise<Character | null> => {
    if (!id) return null;
    
    try {
      const response = await fetch(`/api/characters/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`キャラクター更新に失敗しました: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'キャラクター更新に失敗しました');
      }
      
      setCharacter(result.data.character);
      return result.data.character;
    } catch (error) {
      console.error(`キャラクター更新エラー ${id}:`, error);
      return null;
    }
  };

  /**
   * キャラクターの発展経路を取得する
   */
  const getDevelopmentPath = async (): Promise<any | null> => {
    if (!id) return null;
    
    try {
      const response = await fetch(`/api/characters/${id}/development`);
      
      if (!response.ok) {
        throw new Error(`発展経路取得に失敗しました: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || '発展経路取得に失敗しました');
      }
      
      return result.data;
    } catch (error) {
      console.error(`発展経路取得エラー ${id}:`, error);
      return null;
    }
  };

  /**
   * キャラクター登場記録
   */
  const recordAppearance = async (chapterNumber: number, summary: string, emotionalImpact: number = 0): Promise<any | null> => {
    if (!id) return null;
    
    try {
      const response = await fetch(`/api/characters/${id}/appearances`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chapterNumber, summary, emotionalImpact }),
      });
      
      if (!response.ok) {
        throw new Error(`登場記録に失敗しました: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || '登場記録に失敗しました');
      }
      
      // 最新データを取得
      fetchCharacter();
      
      return result.data;
    } catch (error) {
      console.error(`登場記録エラー ${id}:`, error);
      return null;
    }
  };

  // 初期ロード
  useEffect(() => {
    if (id) {
      fetchCharacter();
    }
  }, [fetchCharacter, id]);

  return {
    character,
    relationships,
    metrics,
    isLoading,
    error,
    refetch: fetchCharacter,
    updateCharacter,
    getDevelopmentPath,
    recordAppearance
  };
};