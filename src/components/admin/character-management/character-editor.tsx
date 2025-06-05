import { useState } from 'react';
import { Character, CharacterType, CharacterRole } from '@/types/characters';

interface CharacterEditorProps {
  character?: Character;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export const CharacterEditor: React.FC<CharacterEditorProps> = ({ 
  character,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: character?.name || '',
    type: character?.type || 'MOB' as CharacterType,
    role: character?.role || 'OTHER' as CharacterRole,
    description: character?.description || '',
    personality: character?.personality?.traits?.join(', ') || '',
    speechPatterns: character?.personality?.speechPatterns?.join(', ') || '',
    appearance: character?.appearance?.physicalDescription || '',
    backstory: character?.backstory?.summary || '',
    isActive: character?.state?.isActive ?? true
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // 入力時にエラーをクリア
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '名前は必須です';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = '説明は必須です';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    // フォームデータをキャラクターオブジェクト形式に変換
    const characterData = {
      id: character?.id || `char-${Date.now()}`,
      name: formData.name,
      type: formData.type,
      role: formData.role,
      description: formData.description,
      personality: {
        traits: formData.personality.split(',').map(trait => trait.trim()).filter(Boolean),
        speechPatterns: formData.speechPatterns.split(',').map(pattern => pattern.trim()).filter(Boolean),
        quirks: [],
        values: []
      },
      appearance: {
        physicalDescription: formData.appearance,
        clothing: '',
        distinguishingFeatures: []
      },
      backstory: {
        summary: formData.backstory,
        significantEvents: [],
        origin: ''
      },
      state: {
        isActive: formData.isActive,
        emotionalState: 'NEUTRAL',
        developmentStage: 0,
        lastAppearance: null
      }
    };
    
    onSave(characterData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="name">
            名前 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : ''}`}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="type">
            キャラクタータイプ
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          >
            <option value="MAIN">メインキャラクター</option>
            <option value="SUB">サブキャラクター</option>
            <option value="MOB">モブキャラクター</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="role">
            役割
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          >
            <option value="PROTAGONIST">主人公</option>
            <option value="ANTAGONIST">敵対者</option>
            <option value="MENTOR">指導者</option>
            <option value="ALLY">仲間</option>
            <option value="RIVAL">ライバル</option>
            <option value="OTHER">その他</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            状態
          </label>
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="isActive" className="text-sm">アクティブ</label>
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="description">
          説明 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={2}
          className={`w-full p-2 border rounded-md ${errors.description ? 'border-red-500' : ''}`}
        ></textarea>
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="personality">
            性格特性（カンマ区切り）
          </label>
          <textarea
            id="personality"
            name="personality"
            value={formData.personality}
            onChange={handleChange}
            rows={3}
            className="w-full p-2 border rounded-md"
            placeholder="勇敢, 正義感が強い, 頑固..."
          ></textarea>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="speechPatterns">
            話し方の特徴（カンマ区切り）
          </label>
          <textarea
            id="speechPatterns"
            name="speechPatterns"
            value={formData.speechPatterns}
            onChange={handleChange}
            rows={3}
            className="w-full p-2 border rounded-md"
            placeholder="「〜だぜ」と語尾を付ける, 敬語を多用..."
          ></textarea>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="appearance">
          外見
        </label>
        <textarea
          id="appearance"
          name="appearance"
          value={formData.appearance}
          onChange={handleChange}
          rows={3}
          className="w-full p-2 border rounded-md"
        ></textarea>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="backstory">
          バックストーリー
        </label>
        <textarea
          id="backstory"
          name="backstory"
          value={formData.backstory}
          onChange={handleChange}
          rows={4}
          className="w-full p-2 border rounded-md"
        ></textarea>
      </div>
      
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          保存
        </button>
      </div>
    </form>
  );
};