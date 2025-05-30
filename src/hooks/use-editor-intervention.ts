// src/hooks/use-editor-intervention.ts
import { useState, useCallback } from 'react';
import {
    InterventionRequest,
    InterventionResponse,
    InterventionType,
    InterventionTarget
  } from '@/types/editor';
  
interface HistoryItem {
  id: string;
  timestamp: string;
  type: InterventionType;      // ✅ 型定義に揃える
  target: InterventionTarget;  // ✅ 型定義に揃える
  command: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  response?: InterventionResponse;
}

export const useEditorIntervention = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submitIntervention = useCallback(async (intervention: InterventionRequest) => {
    setIsLoading(true);
    setError(null);

    const newItem: HistoryItem = {
      id: `int-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      type: intervention.type,
      target: intervention.target,
      command: intervention.command,
      status: 'PENDING'
    };

    setHistory(prev => [newItem, ...prev]);

    try {
      const res = await fetch('/api/editor/interventions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(intervention)
      });

      const data: InterventionResponse = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.feedback?.message || '介入失敗');
      }

      setHistory(prev =>
        prev.map(item =>
          item.id === newItem.id
            ? { ...item, status: 'SUCCESS', response: data }
            : item
        )
      );

      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('不明なエラーが発生しました');

      setHistory(prev =>
        prev.map(item =>
          item.id === newItem.id
            ? { ...item, status: 'FAILED' }
            : item
        )
      );

      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const retryIntervention = useCallback(async (id: string) => {
    const target = history.find(item => item.id === id);
    if (!target) throw new Error('指定された介入が見つかりません');

    const retryRequest: InterventionRequest = {
        type: target.type,
        target: target.target,
        command: target.command
      };

    setHistory(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, status: 'PENDING', response: undefined }
          : item
      )
    );

    return submitIntervention(retryRequest);
  }, [history, submitIntervention]);

  const clearHistory = useCallback(() => setHistory([]), []);

  return {
    history,
    isLoading,
    error,
    submitIntervention,
    retryIntervention,
    clearHistory
  };
};
