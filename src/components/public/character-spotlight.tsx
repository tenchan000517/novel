// src/components/public/character-spotlight.tsx
import { Character } from '@/types/characters';

// モックデータ（実際の実装では API から取得）
const mockCharacters: Partial<Character>[] = [
  {
    id: '1',
    name: '風間 遥人',
    type: 'MAIN',
    description: '17歳の少年。不思議な力を持つが、その力の使い方を模索している。勇気と優しさを持つが、時に優柔不断な面も。',
    state: {
      isActive: true,
      emotionalState: 'DETERMINED',
      developmentStage: 2,
      lastAppearance: 10,
    },
  },
  {
    id: '2',
    name: '鈴木 美咲',
    type: 'MAIN',
    description: '16歳の少女。高い知性と洞察力の持ち主。冷静沈着で論理的だが、心の奥には誰にも言えない秘密を抱えている。',
    state: {
      isActive: true,
      emotionalState: 'CONCERNED',
      developmentStage: 2,
      lastAppearance: 10,
    },
  },
  {
    id: '3',
    name: '黒井 陽介',
    type: 'SUB',
    description: '25歳の冒険家。広い知識と経験を持ち、主人公たちの旅をサポートする。陽気な性格だが、時に危険な選択をすることも。',
    state: {
      isActive: true,
      emotionalState: 'EXCITED',
      developmentStage: 1,
      lastAppearance: 9,
    },
  },
];

export const CharacterSpotlight = () => {
  return (
    <section className="character-spotlight">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">登場キャラクター</h2>
        <a href="/characters" className="text-indigo-600 hover:text-indigo-800 font-medium">
          すべて見る
        </a>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockCharacters.map((character) => (
          <div key={character.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {character.name}
                </h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  character.type === 'MAIN' 
                    ? 'bg-purple-100 text-purple-800' 
                    : character.type === 'SUB' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {character.type === 'MAIN' ? 'メイン' : character.type === 'SUB' ? 'サブ' : 'モブ'}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4 line-clamp-4">
                {character.description}
              </p>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  最終登場: 第{character.state?.lastAppearance}章
                </span>
                <a 
                  href={`/characters/${character.id}`}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                  詳細を見る →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};