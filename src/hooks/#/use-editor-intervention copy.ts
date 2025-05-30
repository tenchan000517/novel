// src/hooks/use-editor-intervention.ts
import { useState } from 'react';
import { InterventionRequest } from '@/types/editor';

interface HistoryItem {
  id: string;
  timestamp: string;
  type: string;
  target: string;
  command: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
}

export const useEditorIntervention = () => {
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      id: 'int-1',
      timestamp: '14:15:20',
      type: 'CHARACTER',
      target: 'CHARACTER',
      command: '鈴木美咲の性格をより内向的にしてください',
      status: 'SUCCESS'
    },
    {
      id: 'int-2',
      timestamp: '13:42:05',
      type: 'PLOT',
      target: 'FUTURE_CHAPTERS',
      command: '次のチャプターで主人公と親友の間に小さな衝突を起こしてください',
      status: 'PENDING'
    },
    {
      id: 'int-3',
      timestamp: '12:30:18',
      type: 'WORLD_SETTINGS',
      target: 'WORLD_SETTINGS',
      command: '魔法システムにより具体的なルールを追加してください',
      status: 'FAILED'
    }
  ]);
  
  const submitIntervention = async (intervention: InterventionRequest) => {
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
    
    // APIリクエストをシミュレーション
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 80%の確率で成功、20%の確率で失敗
    const success = Math.random() > 0.2;
    
    setHistory(prev => 
      prev.map(item => 
        item.id === newItem.id 
          ? { ...item, status: success ? 'SUCCESS' : 'FAILED' } 
          : item
      )
    );
    
    if (!success) {
      throw new Error('介入の処理に失敗しました');
    }
  };
  
  return {
    history,
    submitIntervention
  };
};