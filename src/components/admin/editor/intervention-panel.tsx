// src/components/admin/editor/intervention-panel.tsx
import { useState } from 'react';
import { useEditorIntervention } from '@/hooks/use-editor-intervention';
import { InterventionForm } from './intervention-form';
import { InterventionHistory } from './intervention-history';

export const InterventionPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { submitIntervention, history } = useEditorIntervention();
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">手動介入</h2>
        <p className="text-sm text-gray-600">AIの生成に直接介入できます</p>
      </div>
      
      <div className="p-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          {isOpen ? '介入フォームを閉じる' : '介入フォームを開く'}
        </button>
        
        {isOpen && (
          <InterventionForm
            onSubmit={submitIntervention}
            onClose={() => setIsOpen(false)}
          />
        )}
        
        <InterventionHistory history={history} />
      </div>
    </div>
  );
};