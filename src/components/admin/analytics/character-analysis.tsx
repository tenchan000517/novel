import { useState } from 'react';
import { useCharacterAnalytics } from '@/hooks/use-character-analytics';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PieChart, BarChart } from '@/components/ui/charts';

export const CharacterAnalysis = () => {
  const { data, characterData, isLoading } = useCharacterAnalytics();
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  
  // 選択されたキャラクターのデータを取得
  const selectedCharacterData = selectedCharacter 
    ? characterData.find(c => c.id === selectedCharacter) 
    : null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>キャラクター分析</CardTitle>
        <CardDescription>登場頻度と関係性の分析</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="h-56">
              <h3 className="text-sm font-medium mb-2">登場頻度分布</h3>
              <PieChart
                data={data.appearances.map(item => ({
                  label: item.name,
                  value: item.count,
                  color: item.color
                }))}
              />
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">キャラクター選択</h3>
              <div className="flex flex-wrap gap-2">
                {characterData.map(character => (
                  <button
                    key={character.id}
                    onClick={() => setSelectedCharacter(character.id)}
                    className={`px-3 py-1 text-xs rounded-full ${
                      selectedCharacter === character.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {character.name}
                  </button>
                ))}
              </div>
            </div>
            
            {selectedCharacterData ? (
              <div className="space-y-4">
                <div className="h-40">
                  <h3 className="text-sm font-medium mb-2">発展度</h3>
                  <BarChart
                    data={selectedCharacterData.development}
                    xKey="category"
                    yKey="value"
                    color={selectedCharacterData.color || '#3B82F6'}
                  />
                </div>
                
                <div className="p-3 bg-gray-50 rounded-md">
                  <h3 className="text-sm font-medium mb-2">最近の状態</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-gray-500">感情状態</div>
                      <div>{selectedCharacterData.emotionalState}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">最終登場</div>
                      <div>チャプター {selectedCharacterData.lastAppearance}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">登場回数</div>
                      <div>{selectedCharacterData.appearanceCount} 回</div>
                    </div>
                    <div>
                      <div className="text-gray-500">関連キャラクター</div>
                      <div>{selectedCharacterData.relatedCharacters} 人</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                分析するキャラクターを選択してください
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};