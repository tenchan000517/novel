// src/components/admin/editor/dashboard.tsx
import { useState, useEffect } from 'react';
import { Chapter } from '@/types/chapters';
import { Character } from '@/types/characters';

interface StoryMetrics {
  chapterCount: number;
  characterCount: number;
  wordCount: number;
  qualityAverage: number;
}

export const EditorDashboard: React.FC = () => {
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [recentCharacters, setRecentCharacters] = useState<Character[]>([]);
  const [metrics, setMetrics] = useState<StoryMetrics>({
    chapterCount: 0,
    characterCount: 0,
    wordCount: 0,
    qualityAverage: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // APIからデータを取得
    const fetchData = async () => {
      try {
        // データフェッチのシミュレーション
        setTimeout(() => {
          setCurrentChapter({
            id: 'chapter-42',
            title: '運命の十字路',
            chapterNumber: 42,
            content: '長い章の内容...',
            wordCount: 8250,
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata: {
              pov: '主人公',
              location: '古代寺院',
              timeframe: '夕暮れ時',
              emotionalTone: '緊張感',
              keywords: ['戦闘', '決断', '友情'],
              qualityScore: 0.87
            }
          })

          setRecentCharacters([
            {
              id: 'char-1',
              name: '高橋勇気',
              type: 'MAIN',
              description: '主人公。17歳の高校生で、隠された力を持つ。',
              role: 'PROTAGONIST',
              state: {
                isActive: true,
                emotionalState: 'DETERMINED',
                developmentStage: 3,
                lastAppearance: 42
              },
              history: {
                appearances: [],
                interactions: [],
                developmentPath: []
              },
              metadata: {
                createdAt: new Date(),
                lastUpdated: new Date()
              }
            },
            {
              id: 'char-2',
              name: '鈴木美咲',
              type: 'SUB',
              description: '主人公のクラスメイト。秘密を知っている。',
              role: 'ALLY',
              state: {
                isActive: true,
                emotionalState: 'CONCERNED',
                developmentStage: 2,
                lastAppearance: 40
              },
              history: {
                appearances: [],
                interactions: [],
                developmentPath: []
              },
              metadata: {
                createdAt: new Date(),
                lastUpdated: new Date()
              }
            }
          ]);

          setMetrics({
            chapterCount: 42,
            characterCount: 24,
            wordCount: 336000,
            qualityAverage: 0.85
          });

          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error('データの取得に失敗しました:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold">物語の現在状況</h2>
        <p className="text-sm text-gray-600">最新の章と重要な指標</p>
      </div>

      <div className="p-6">
        {currentChapter && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-800">現在のチャプター</h3>
            <div className="flex justify-between items-center mt-2">
              <div>
                <p className="text-xl font-bold">{currentChapter.title}</p>
                <p className="text-sm text-gray-600">チャプター {currentChapter.chapterNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm">{currentChapter.wordCount} 単語</p>
                <p className="text-sm">
                  品質スコア: 
                  <span className={`ml-1 font-medium ${
                    currentChapter.metadata.qualityScore && currentChapter.metadata.qualityScore > 0.8 
                      ? 'text-green-600' 
                      : currentChapter.metadata.qualityScore && currentChapter.metadata.qualityScore > 0.6 
                        ? 'text-yellow-600' 
                        : 'text-red-600'
                  }`}>
                    {currentChapter.metadata.qualityScore 
                      ? Math.round(currentChapter.metadata.qualityScore * 100) 
                      : '??'}%
                  </span>
                </p>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-gray-500">視点:</span> {currentChapter.metadata.pov}
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-gray-500">場所:</span> {currentChapter.metadata.location}
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-gray-500">時間:</span> {currentChapter.metadata.timeframe}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700">チャプター数</p>
            <p className="text-2xl font-bold">{metrics.chapterCount}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-700">キャラクター数</p>
            <p className="text-2xl font-bold">{metrics.characterCount}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-700">総単語数</p>
            <p className="text-2xl font-bold">{metrics.wordCount.toLocaleString()}</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg">
            <p className="text-sm text-amber-700">平均品質</p>
            <p className="text-2xl font-bold">{Math.round(metrics.qualityAverage * 100)}%</p>
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-800 mb-3">最近のキャラクター</h3>
          <div className="space-y-3">
            {recentCharacters.map(character => (
              <div 
                key={character.id} 
                className="border rounded-md p-3 flex justify-between items-center hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium">{character.name}</p>
                  <p className="text-sm text-gray-600">{character.description}</p>
                </div>
                <div className="text-right text-sm">
                  <p className={`font-medium ${
                    character.type === 'MAIN' 
                      ? 'text-indigo-600' 
                      : character.type === 'SUB' 
                        ? 'text-blue-600' 
                        : 'text-gray-600'
                  }`}>
                    {character.type}
                  </p>
                  <p className="text-gray-500">最終登場: Ch.{character.state.lastAppearance}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};