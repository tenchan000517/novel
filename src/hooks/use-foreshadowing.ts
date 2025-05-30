// src/hooks/useForeshadowing.ts
import { useState, useEffect, useCallback } from 'react';
import { logError } from '@/lib/utils/error-handler';
import { logger } from '@/lib/utils/logger';
import { memoryManager } from '@/lib/memory';
import { Foreshadowing } from '@/types/memory';

/**
 * UI表示用の伏線要素の型定義
 */
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
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 伏線の統計情報の型定義
 */
interface ForeshadowingStatistics {
  totalCount: number;
  resolvedCount: number;
  pendingCount: number;
  highPriorityCount: number;
  mediumPriorityCount: number;
  lowPriorityCount: number;
  plannedResolutionCount: number;
}

/**
 * 伏線データを管理するカスタムフック
 */
export const useForeshadowing = () => {
  const [foreshadowingElements, setForeshadowingElements] = useState<ForeshadowingElement[]>([]);
  const [statistics, setStatistics] = useState<ForeshadowingStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  /**
   * バックエンドから伏線データを取得する
   */
  const fetchForeshadowingData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      logger.debug('伏線データの取得を開始');
      
      // まずmemoryManagerを初期化（必要な場合）
      if (!(await memoryManager.isInitialized())) {
        await memoryManager.initialize();
      }
      
      // LongTermMemoryから伏線情報を取得
      const foreshadowing = await memoryManager.getLongTermMemory().getForeshadowing();
      
      // バックエンドの型からUI用の型に変換
      const elements = foreshadowing.map(convertToForeshadowingElement);
      
      // 統計情報の計算
      const stats = calculateStatistics(elements);
      
      setForeshadowingElements(elements);
      setStatistics(stats);
      setLastUpdated(new Date());
      
      logger.info(`${elements.length}件の伏線データを取得しました`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '伏線データの取得に失敗しました';
      setError(errorMessage);
      logError(error, {}, '伏線データ取得中にエラーが発生しました');
      
      // エラー時は状態を空に初期化
      setForeshadowingElements([]);
      setStatistics({
        totalCount: 0,
        resolvedCount: 0,
        pendingCount: 0,
        highPriorityCount: 0,
        mediumPriorityCount: 0,
        lowPriorityCount: 0,
        plannedResolutionCount: 0
      });
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * 新しい伏線を追加する
   */
  const addForeshadowingElement = useCallback(async (element: Omit<ForeshadowingElement, 'id'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // まずmemoryManagerを初期化（必要な場合）
      if (!(await memoryManager.isInitialized())) {
        await memoryManager.initialize();
      }
      
      // 重複チェック
      const isDuplicate = await memoryManager.getLongTermMemory().checkDuplicateForeshadowing(element.description);
      if (isDuplicate) {
        throw new Error(`同じ説明の伏線「${element.description}」が既に存在します`);
      }
      
      // バックエンド向けのデータに変換
      const backendForeshadowing: Partial<Foreshadowing> = {
        description: element.description,
        chapter_introduced: element.chapterIntroduced,
        resolved: element.isResolved,
        urgency: mapPriorityToUrgency(element.priority),
        context: element.context,
        plannedResolution: element.plannedResolution,
        relatedCharacters: element.relatedCharacters,
        relatedElements: element.relatedElements
      };
      
      // 伏線を追加
      await memoryManager.getLongTermMemory().addForeshadowing(backendForeshadowing);
      
      // データを再取得して最新状態を反映
      await fetchForeshadowingData();
      
      logger.info('新しい伏線を追加しました', { description: element.description });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '伏線の追加に失敗しました';
      setError(errorMessage);
      logError(error, {}, '伏線の追加中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }, [fetchForeshadowingData]);
  
  /**
   * 伏線の解決をマークする
   */
  const resolveForeshadowingElement = useCallback(async (
    id: string, 
    resolutionChapter: number,
    resolutionDescription: string
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // まずmemoryManagerを初期化（必要な場合）
      if (!(await memoryManager.isInitialized())) {
        await memoryManager.initialize();
      }
      
      // 伏線を解決
      await memoryManager.getLongTermMemory().resolveForeshadowing(
        id, 
        resolutionChapter, 
        resolutionDescription
      );
      
      // データを再取得して最新状態を反映
      await fetchForeshadowingData();
      
      logger.info(`伏線 "${id}" を解決しました`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '伏線の解決に失敗しました';
      setError(errorMessage);
      logError(error, {}, '伏線の解決中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }, [fetchForeshadowingData]);
  
  /**
   * 伏線要素を更新する
   */
  const updateForeshadowingElement = useCallback(async (
    id: string,
    updates: Partial<Omit<ForeshadowingElement, 'id'>>
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // まずmemoryManagerを初期化（必要な場合）
      if (!(await memoryManager.isInitialized())) {
        await memoryManager.initialize();
      }
      
      // バックエンド用のデータに変換
      const backendUpdates: Partial<Foreshadowing> = {};
      
      if (updates.description !== undefined) backendUpdates.description = updates.description;
      if (updates.chapterIntroduced !== undefined) backendUpdates.chapter_introduced = updates.chapterIntroduced;
      if (updates.isResolved !== undefined) backendUpdates.resolved = updates.isResolved;
      if (updates.priority !== undefined) backendUpdates.urgency = mapPriorityToUrgency(updates.priority);
      if (updates.context !== undefined) backendUpdates.context = updates.context;
      if (updates.plannedResolution !== undefined) backendUpdates.plannedResolution = updates.plannedResolution;
      if (updates.relatedCharacters !== undefined) backendUpdates.relatedCharacters = updates.relatedCharacters;
      if (updates.relatedElements !== undefined) backendUpdates.relatedElements = updates.relatedElements;
      
      // 更新リクエストが空でないか確認
      if (Object.keys(backendUpdates).length === 0) {
        throw new Error('更新する内容がありません');
      }
      
      // 伏線を更新
      await memoryManager.getLongTermMemory().updateForeshadowing(id, backendUpdates);
      
      // データを再取得して最新状態を反映
      await fetchForeshadowingData();
      
      logger.info(`伏線 "${id}" を更新しました`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '伏線の更新に失敗しました';
      setError(errorMessage);
      logError(error, {}, '伏線の更新中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }, [fetchForeshadowingData]);
  
  /**
   * 伏線要素を削除する
   */
  const deleteForeshadowingElement = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // まずmemoryManagerを初期化（必要な場合）
      if (!(await memoryManager.isInitialized())) {
        await memoryManager.initialize();
      }
      
      // 伏線を削除
      await memoryManager.getLongTermMemory().deleteForeshadowing(id);
      
      // データを再取得して最新状態を反映
      await fetchForeshadowingData();
      
      logger.info(`伏線 "${id}" を削除しました`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '伏線の削除に失敗しました';
      setError(errorMessage);
      logError(error, {}, '伏線の削除中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }, [fetchForeshadowingData]);
  
  /**
   * 現在のチャプターで解決すべき伏線を推奨
   */
  const suggestForeshadowingToResolve = useCallback(async (currentChapter: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // まずmemoryManagerを初期化（必要な場合）
      if (!(await memoryManager.isInitialized())) {
        await memoryManager.initialize();
      }
      
      // 解決が推奨される伏線を取得
      const suggestions = await memoryManager.getLongTermMemory().suggestForeshadowingToResolve(currentChapter);
      
      // UI用に変換
      return suggestions.map(convertToForeshadowingElement);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '伏線の推奨取得に失敗しました';
      setError(errorMessage);
      logError(error, {}, '伏線推奨取得中にエラーが発生しました');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * バックエンドの伏線データをUI用に変換する
   */
  const convertToForeshadowingElement = (foreshadowing: Foreshadowing): ForeshadowingElement => {
    // 優先度のマッピング
    const priority = mapUrgencyToPriority(foreshadowing.urgency);
    
    return {
      id: foreshadowing.id,
      description: foreshadowing.description,
      context: foreshadowing.context || '詳細情報なし',
      chapterIntroduced: foreshadowing.chapter_introduced,
      isResolved: foreshadowing.resolved,
      plannedResolution: foreshadowing.plannedResolution || foreshadowing.resolution_chapter,
      priority,
      relatedCharacters: foreshadowing.relatedCharacters || [],
      relatedElements: foreshadowing.relatedElements || [],
      createdAt: foreshadowing.createdTimestamp,
      updatedAt: foreshadowing.updatedTimestamp
    };
  };
  
  /**
   * 優先度文字列を緊急度文字列に変換する
   */
  const mapPriorityToUrgency = (priority: 'HIGH' | 'MEDIUM' | 'LOW'): string => {
    switch (priority) {
      case 'HIGH': return 'high';
      case 'MEDIUM': return 'medium';
      case 'LOW': return 'low';
      default: return 'medium';
    }
  };
  
  /**
   * 緊急度文字列を優先度に変換する
   */
  const mapUrgencyToPriority = (urgency: string): 'HIGH' | 'MEDIUM' | 'LOW' => {
    switch (urgency.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'HIGH';
      case 'medium':
        return 'MEDIUM';
      case 'low':
      default:
        return 'LOW';
    }
  };
  
  /**
   * 伏線要素から統計情報を計算する
   */
  const calculateStatistics = (elements: ForeshadowingElement[]): ForeshadowingStatistics => {
    const resolved = elements.filter(e => e.isResolved);
    const pending = elements.filter(e => !e.isResolved);
    const highPriority = elements.filter(e => e.priority === 'HIGH');
    const mediumPriority = elements.filter(e => e.priority === 'MEDIUM');
    const lowPriority = elements.filter(e => e.priority === 'LOW');
    const plannedResolution = pending.filter(e => e.plannedResolution !== undefined);
    
    return {
      totalCount: elements.length,
      resolvedCount: resolved.length,
      pendingCount: pending.length,
      highPriorityCount: highPriority.length,
      mediumPriorityCount: mediumPriority.length,
      lowPriorityCount: lowPriority.length,
      plannedResolutionCount: plannedResolution.length
    };
  };
  
  // 初回レンダリング時にデータを取得
  useEffect(() => {
    fetchForeshadowingData();
  }, [fetchForeshadowingData]);
  
  return { 
    foreshadowingElements, 
    statistics, 
    isLoading,
    error,
    lastUpdated,
    fetchForeshadowingData,
    addForeshadowingElement,
    resolveForeshadowingElement,
    updateForeshadowingElement,
    deleteForeshadowingElement,
    suggestForeshadowingToResolve
  };
};