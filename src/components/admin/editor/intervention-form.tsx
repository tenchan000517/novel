// src/components/admin/editor/intervention-form.tsx
import { useState } from 'react';
import { InterventionRequest, InterventionType, InterventionTarget, InterventionResponse } from '@/types/editor';

interface InterventionFormProps {
  onSubmit: (intervention: InterventionRequest) => Promise<InterventionResponse>;
  onClose: () => void;
}

export const InterventionForm: React.FC<InterventionFormProps> = ({ onSubmit, onClose }) => {
  const [type, setType] = useState<InterventionType>('CHARACTER');
  const [target, setTarget] = useState<InterventionTarget>('CURRENT_CHAPTER');
  const [command, setCommand] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        type,
        target,
        command,
        parameters: {}
      });
      
      setCommand('');
      onClose();
    } catch (error) {
      console.error('介入の送信に失敗しました:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="mt-4 bg-gray-50 p-4 rounded-md">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            介入タイプ
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as InterventionType)}
            className="w-full p-2 border rounded-md"
            disabled={isSubmitting}
          >
            <option value="CHARACTER">キャラクター</option>
            <option value="PLOT">プロット</option>
            <option value="MEMORY">記憶</option>
            <option value="GENERATION">生成</option>
            <option value="SYSTEM">システム</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            介入ターゲット
          </label>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value as InterventionTarget)}
            className="w-full p-2 border rounded-md"
            disabled={isSubmitting}
          >
            <option value="CURRENT_CHAPTER">現在のチャプター</option>
            <option value="FUTURE_CHAPTERS">今後のチャプター</option>
            <option value="CHARACTER">キャラクター</option>
            <option value="MEMORY">記憶</option>
            <option value="WORLD_SETTINGS">世界設定</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            コマンド（自然言語）
          </label>
          <textarea
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            className="w-full p-2 border rounded-md h-24"
            placeholder="例: 主人公の性格をより内向的にしてください"
            disabled={isSubmitting}
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border rounded-md hover:bg-gray-100"
            disabled={isSubmitting}
          >
            キャンセル
          </button>
          <button
            type="submit"
            className={`px-4 py-2 bg-blue-600 text-white rounded-md ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
            disabled={isSubmitting || !command.trim()}
          >
            {isSubmitting ? '送信中...' : '送信'}
          </button>
        </div>
      </form>
    </div>
  );
};