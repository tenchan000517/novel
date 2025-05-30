import { useEffect, useRef, useState } from 'react';
import { useCharacterRelationships } from '@/hooks/use-character-relationships';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { RelationshipType } from '@/types/characters';
import { Select, SelectOption } from '@/components/ui/select';

export const RelationshipGraph = () => {
  const { data, isLoading, getRelationshipColor, getRelationshipLabel } = useCharacterRelationships();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [filterType, setFilterType] = useState<RelationshipType | 'ALL'>('ALL');
  
  useEffect(() => {
    if (isLoading || !canvasRef.current || !data.nodes.length) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // キャンバスをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // キャンバスのサイズを設定
    const width = canvas.width;
    const height = canvas.height;
    
    // ノードの半径を設定（サイズに応じて調整）
    const baseRadius = 20;
    
    // ノードの位置を計算（円形に配置）
    const nodePositions = data.nodes.map((node, index) => {
      const angle = (index / data.nodes.length) * Math.PI * 2;
      const distance = Math.min(width, height) * 0.35;
      return {
        id: node.id,
        x: width / 2 + Math.cos(angle) * distance,
        y: height / 2 + Math.sin(angle) * distance,
        radius: baseRadius + (node.size ? Math.min(node.size, 5) : 0),
      };
    });
    
    // ノードIDから位置情報へのマッピングを作成
    const nodePositionMap = new Map();
    nodePositions.forEach(pos => {
      nodePositionMap.set(pos.id, pos);
    });
    
    // エッジを描画（フィルターに応じて）
    const visibleLinks = filterType === 'ALL' 
      ? data.links 
      : data.links.filter(link => link.type === filterType);
    
    visibleLinks.forEach(link => {
      const sourcePos = nodePositionMap.get(link.source);
      const targetPos = nodePositionMap.get(link.target);
      
      if (!sourcePos || !targetPos) return;
      
      // エッジの色を関係タイプから取得
      ctx.strokeStyle = getRelationshipColor(link.type);
      
      // 線の太さは関係の強さに基づく
      ctx.lineWidth = link.strength * 3;
      
      // エッジを描画
      ctx.beginPath();
      ctx.moveTo(sourcePos.x, sourcePos.y);
      ctx.lineTo(targetPos.x, targetPos.y);
      ctx.stroke();
      
      // 関係タイプのラベルを中央に表示（オプション）
      if (link.strength > 0.7) {
        const midX = (sourcePos.x + targetPos.x) / 2;
        const midY = (sourcePos.y + targetPos.y) / 2;
        
        ctx.fillStyle = 'white';
        ctx.font = '8px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 背景を描画
        const label = getRelationshipLabel(link.type);
        const metrics = ctx.measureText(label);
        const padding = 2;
        
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(
          midX - metrics.width / 2 - padding,
          midY - 6 - padding,
          metrics.width + padding * 2,
          12 + padding * 2
        );
        
        // テキストを描画
        ctx.fillStyle = 'white';
        ctx.fillText(label, midX, midY);
      }
    });
    
    // ノードを描画
    data.nodes.forEach(node => {
      const pos = nodePositionMap.get(node.id);
      if (!pos) return;
      
      // ノードの背景色（キャラクタータイプまたは指定された色に基づく）
      ctx.fillStyle = node.color || 
        (node.type === 'MAIN' ? '#818CF8' : 
         node.type === 'SUB' ? '#60A5FA' : '#D1D5DB');
      
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, pos.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // ノードの枠線
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, pos.radius, 0, Math.PI * 2);
      ctx.stroke();
      
      // ノード名を描画
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // 名前が長い場合は短縮
      const displayName = node.name.length > 6 
        ? node.name.substring(0, 6) + '..' 
        : node.name;
      
      ctx.fillText(displayName, pos.x, pos.y);
    });
    
  }, [data, isLoading, filterType, getRelationshipColor, getRelationshipLabel]);
  
  // 主要な関係タイプの配列
  const mainRelationshipTypes: RelationshipType[] = [
    'FRIEND', 'ENEMY', 'LOVER', 'MENTOR', 'STUDENT', 'RIVAL'
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>キャラクター関係図</CardTitle>
        <CardDescription>キャラクター間の関係性を可視化</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-md"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as RelationshipType | 'ALL')}
                options={[
                  { value: 'ALL', label: '全ての関係' },
                  ...mainRelationshipTypes.map(type => ({
                    value: type,
                    label: getRelationshipLabel(type)
                  }))
                ]}
                placeholder="関係タイプでフィルター"
                className="w-[180px]"
              />
            </div>
            
            <div className="h-64 relative">
              <canvas 
                ref={canvasRef} 
                width={400} 
                height={300}
                className="w-full h-full"
              ></canvas>
              
              <div className="absolute bottom-2 right-2 text-xs bg-white bg-opacity-70 p-2 rounded">
                <div className="text-xs font-semibold mb-1">関係タイプ</div>
                {mainRelationshipTypes.map((type) => (
                  <div key={type} className="flex items-center mb-1">
                    <span 
                      className="w-3 h-3 rounded-full inline-block mr-1"
                      style={{ backgroundColor: getRelationshipColor(type) }}
                    ></span>
                    <span>{getRelationshipLabel(type)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              {data.nodes.length > 0 && (
                <p>
                  {data.nodes.length}人のキャラクター間に{data.links.length}の関係性が存在します
                  {data.metrics.strongestRelationship && (
                    <>。最も強い関係は
                      <span className="font-medium">
                        {data.nodes.find(n => n.id === data.metrics.strongestRelationship?.source)?.name || '?'} と 
                        {data.nodes.find(n => n.id === data.metrics.strongestRelationship?.target)?.name || '?'}
                      </span>
                      の間の{getRelationshipLabel(data.metrics.strongestRelationship.type)}関係です
                    </>
                  )}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};