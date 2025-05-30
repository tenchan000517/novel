import { useState } from 'react';
import { useCharacters } from '@/hooks/use-characters';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export const CharacterList = () => {
  const { characters, isLoading } = useCharacters();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
  // キャラクターのタイプでフィルタリング
  const filteredCharacters = selectedType 
    ? characters.filter(character => character.type === selectedType)
    : characters;
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'MAIN':
        return 'text-indigo-600 bg-indigo-50';
      case 'SUB':
        return 'text-blue-600 bg-blue-50';
      case 'MOB':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };
  
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'MAIN':
        return 'メイン';
      case 'SUB':
        return 'サブ';
      case 'MOB':
        return 'モブ';
      default:
        return type;
    }
  };
  
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'PROTAGONIST':
        return '主人公';
      case 'ANTAGONIST':
        return '敵対者';
      case 'MENTOR':
        return '指導者';
      case 'ALLY':
        return '仲間';
      case 'RIVAL':
        return 'ライバル';
      default:
        return 'その他';
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>キャラクター一覧</CardTitle>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedType(null)}
              className={`px-3 py-1 text-xs rounded-full ${
                selectedType === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              すべて
            </button>
            <button
              onClick={() => setSelectedType('MAIN')}
              className={`px-3 py-1 text-xs rounded-full ${
                selectedType === 'MAIN'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
              }`}
            >
              メイン
            </button>
            <button
              onClick={() => setSelectedType('SUB')}
              className={`px-3 py-1 text-xs rounded-full ${
                selectedType === 'SUB'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            >
              サブ
            </button>
            <button
              onClick={() => setSelectedType('MOB')}
              className={`px-3 py-1 text-xs rounded-full ${
                selectedType === 'MOB'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-200'
              }`}
            >
              モブ
            </button>
          </div>
        </div>
        <CardDescription>
          {selectedType 
            ? `${getTypeLabel(selectedType)}キャラクター (${filteredCharacters.length}人)`
            : `全キャラクター (${characters.length}人)`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-md"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCharacters.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                表示するキャラクターはありません
              </p>
            ) : (
              filteredCharacters.map(character => (
                <Link 
                  href={`/characters/${character.id}`} 
                  key={character.id}
                  className="block"
                >
                  <div className="border rounded-md p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{character.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{character.description}</p>
                        
                        {character.state?.lastAppearance && (
                          <p className="text-xs text-gray-500 mt-2">
                            最終登場: チャプター {character.state.lastAppearance}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(character.type)}`}>
                          {getTypeLabel(character.type)}
                        </span>
                        {character.role && (
                          <span className="text-xs text-gray-500 mt-1">
                            {getRoleLabel(character.role)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};