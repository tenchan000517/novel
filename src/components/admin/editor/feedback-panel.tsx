// src/components/admin/editor/feedback-panel.tsx
import { useState } from 'react';
import { FeedbackType } from '@/types/editor';

interface FeedbackPanelProps {
  chapterId: string;
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ chapterId }) => {
  const [type, setType] = useState<FeedbackType>('QUALITY');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState<number>(3);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [newSuggestion, setNewSuggestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  
  const handleAddSuggestion = () => {
    if (newSuggestion.trim()) {
      setSuggestions([...suggestions, newSuggestion.trim()]);
      setNewSuggestion('');
    }
  };
  
  const handleRemoveSuggestion = (index: number) => {
    setSuggestions(suggestions.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // APIリクエストをシミュレーション
      const response = await new Promise<any>(resolve => {
        setTimeout(() => {
          resolve({
            acknowledged: true,
            actionItems: [
              {
                title: 'フィードバックの確認',
                priority: 'MEDIUM',
                assignee: 'EDITOR'
              },
              {
                title: '品質改善の実施',
                priority: 'HIGH',
                assignee: 'SYSTEM'
              }
            ]
          });
        }, 1000);
      });
      
      setFeedback(response);
      setContent('');
      setRating(3);
      setSuggestions([]);
    } catch (error) {
      console.error('フィードバックの送信に失敗しました:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">フィードバック</h2>
        <p className="text-sm text-gray-600">AIの改善に役立つフィードバックを送信してください</p>
      </div>
      
      <div className="p-4">
        {feedback ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
            <h3 className="font-medium text-green-800 mb-2">フィードバックが送信されました</h3>
            <p className="text-sm text-green-700 mb-3">以下のアクションが作成されました:</p>
            <ul className="list-disc pl-5 text-sm text-green-700">
              {feedback.actionItems.map((item: any, index: number) => (
                <li key={index} className="mb-1">
                  {item.title} ({item.priority})
                </li>
              ))}
            </ul>
            <button
              onClick={() => setFeedback(null)}
              className="mt-3 text-sm text-green-700 hover:text-green-900"
            >
              新しいフィードバックを送信
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                フィードバックタイプ
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as FeedbackType)}
                className="w-full p-2 border rounded-md"
                disabled={isSubmitting}
              >
                <option value="QUALITY">品質</option>
                <option value="CONSISTENCY">一貫性</option>
                <option value="PLOT">プロット</option>
                <option value="CHARACTER">キャラクター</option>
                <option value="STYLE">文体</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                評価
              </label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className={`w-8 h-8 flex items-center justify-center rounded-full ${
                      rating >= value ? 'bg-yellow-400 text-white' : 'bg-gray-200 text-gray-600'
                    } transition-colors`}
                    disabled={isSubmitting}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                フィードバック内容
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-2 border rounded-md h-24"
                placeholder="フィードバックを入力してください"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                提案
              </label>
              <div className="flex mb-2">
                <input
                  type="text"
                  value={newSuggestion}
                  onChange={(e) => setNewSuggestion(e.target.value)}
                  className="flex-1 p-2 border rounded-l-md"
                  placeholder="提案を入力"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={handleAddSuggestion}
                  className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                  disabled={isSubmitting || !newSuggestion.trim()}
                >
                  追加
                </button>
              </div>
              {suggestions.length > 0 && (
                <ul className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center bg-gray-50 p-2 rounded-md"
                    >
                      <span className="text-sm">{suggestion}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSuggestion(index)}
                        className="text-red-500 hover:text-red-700"
                        disabled={isSubmitting}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="text-right">
              <button
                type="submit"
                className={`px-4 py-2 bg-green-600 text-white rounded-md ${
                  isSubmitting || !content.trim() ? 'opacity-70 cursor-not-allowed' : 'hover:bg-green-700'
                }`}
                disabled={isSubmitting || !content.trim()}
              >
                {isSubmitting ? '送信中...' : '送信'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};