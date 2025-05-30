// src/components/admin/analytics/tension-curve.tsx
import React from 'react';
import { useTensionData } from '@/hooks/use-tension-data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';

export const TensionCurve = () => {
  const { data, keyEvents, isLoading, error, lastUpdated, refresh } = useTensionData();
  
  // フォーマット関数
  const formatLastUpdated = (date: Date | null) => {
    if (!date) return 'データなし';
    return date.toLocaleString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  // グラフ用のカスタムツールチップ
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const event = keyEvents.find(e => e.chapter === label);
      
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="font-medium">チャプター {label}</p>
          <p className="text-sm">テンション値: {(payload[0].value * 100).toFixed(0)}%</p>
          {event && (
            <div className="mt-2 pt-2 border-t">
              <p className="text-sm font-medium">{event.title}</p>
              <p className="text-xs text-gray-600">{event.description}</p>
            </div>
          )}
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>物語のテンション推移</CardTitle>
            <CardDescription>チャプターごとの心理的緊張度の変化</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              最終更新: {formatLastUpdated(lastUpdated)}
            </span>
            <button
              onClick={refresh}
              disabled={isLoading}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 rounded transition disabled:opacity-50"
            >
              <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
              更新
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded">
            エラーが発生しました: {error.message}
          </div>
        )}
        
        {isLoading && data.length === 0 ? (
          <div className="flex justify-center p-6">
            <div className="animate-pulse">データ読み込み中...</div>
          </div>
        ) : data.length > 0 ? (
          <>
            <div className="h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data}
                  margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="chapter" label={{ value: 'チャプター', position: 'insideBottomRight', offset: -10 }} />
                  <YAxis 
                    domain={[0, 1]} 
                    tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                    label={{ value: 'テンション', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="tension" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  
                  {/* キーイベントをグラフ上に表示 */}
                  {keyEvents.map(event => (
                    <ReferenceDot
                      key={event.id}
                      x={event.chapter}
                      y={event.tensionValue}
                      r={6}
                      fill="#3b82f6"
                      stroke="none"
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">主要イベント</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {keyEvents.sort((a, b) => a.chapter - b.chapter).map(event => (
                  <div key={event.id} className="flex text-sm border-l-2 border-red-500 pl-3 py-1">
                    <div className="flex-1">
                      <div className="font-medium">{event.title}</div>
                      <div className="text-gray-600">{event.description}</div>
                    </div>
                    <div className="text-right text-gray-500 whitespace-nowrap ml-2">
                      Ch.{event.chapter}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              <ul className="list-disc pl-5">
                <li>重要なイベント時にはテンションが上昇</li>
                <li>適度な起伏で読者の興味を維持</li>
                <li>物語のクライマックスに向けてテンションが段階的に高まる</li>
              </ul>
            </div>
          </>
        ) : (
          <div className="text-center p-4 text-gray-500">
            テンションデータがありません。更新ボタンを押してください。
          </div>
        )}
      </CardContent>
    </Card>
  );
};