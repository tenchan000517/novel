// import { useEffect, useRef } from 'react';
// import { useCharacterRelationships } from '@/hooks/use-character-relationships';
// import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

// export const RelationshipGraph = () => {
//   const { relationships, isLoading } = useCharacterRelationships();
//   const canvasRef = useRef<HTMLCanvasElement>(null);
  
//   useEffect(() => {
//     if (isLoading || !canvasRef.current || !relationships.nodes.length) return;
    
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
//     if (!ctx) return;
    
//     // キャンバスをクリア
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
    
//     // キャンバスのサイズを設定
//     const width = canvas.width;
//     const height = canvas.height;
    
//     // ノードの半径と中心位置
//     const radius = 20;
//     const centerX = width / 2;
//     const centerY = height / 2;
    
//     // ノードの位置を計算（円形に配置）
//     const nodePositions = relationships.nodes.map((_, index) => {
//       const angle = (index / relationships.nodes.length) * Math.PI * 2;
//       const distance = Math.min(width, height) * 0.35;
//       return {
//         x: centerX + Math.cos(angle) * distance,
//         y: centerY + Math.sin(angle) * distance
//       };
//     });
    
//     // エッジを描画
//     relationships.edges.forEach(edge => {
//       const sourcePos = nodePositions[edge.source];
//       const targetPos = nodePositions[edge.target];
      
//       // エッジの色を設定
//       ctx.strokeStyle = edge.type === 'POSITIVE' 
//         ? '#3B82F6' // 青
//         : edge.type === 'NEGATIVE'
//           ? '#EF4444' // 赤
//           : '#9CA3AF'; // グレー
      
//       ctx.lineWidth = edge.strength * 3;
      
//       // エッジを描画
//       ctx.beginPath();
//       ctx.moveTo(sourcePos.x, sourcePos.y);
//       ctx.lineTo(targetPos.x, targetPos.y);
//       ctx.stroke();
//     });
    
//     // ノードを描画
//     relationships.nodes.forEach((node, index) => {
//       const pos = nodePositions[index];
      
//       // ノードの背景
//       ctx.fillStyle = node.type === 'MAIN' 
//         ? '#818CF8' // インディゴ
//         : node.type === 'SUB'
//           ? '#60A5FA' // ブルー
//           : '#D1D5DB'; // グレー
      
//       ctx.beginPath();
//       ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
//       ctx.fill();
      
//       // ノードの枠線
//       ctx.strokeStyle = '#FFFFFF';
//       ctx.lineWidth = 2;
//       ctx.beginPath();
//       ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
//       ctx.stroke();
      
//       // ノード名を描画
//       ctx.fillStyle = '#FFFFFF';
//       ctx.font = '10px sans-serif';
//       ctx.textAlign = 'center';
//       ctx.textBaseline = 'middle';
      
//       // 名前が長い場合は短縮
//       const displayName = node.name.length > 5 
//         ? node.name.substring(0, 5) + '..' 
//         : node.name;
      
//       ctx.fillText(displayName, pos.x, pos.y);
//     });
//   }, [relationships, isLoading]);
  
//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>キャラクター関係図</CardTitle>
//         <CardDescription>キャラクター間の関係性を可視化</CardDescription>
//       </CardHeader>
//       <CardContent>
//         {isLoading ? (
//           <div className="animate-pulse">
//             <div className="h-64 bg-gray-200 rounded-md"></div>
//           </div>
//         ) : (
//           <div className="h-64 relative">
//             <canvas 
//               ref={canvasRef} 
//               width={400} 
//               height={300}
//               className="w-full h-full"
//             ></canvas>
            
//             <div className="absolute bottom-2 right-2 text-xs bg-white bg-opacity-70 p-1 rounded">
//               <div className="flex items-center">
//                 <span className="w-3 h-3 rounded-full bg-blue-400 inline-block mr-1"></span>
//                 <span>友好</span>
//               </div>
//               <div className="flex items-center">
//                 <span className="w-3 h-3 rounded-full bg-red-400 inline-block mr-1"></span>
//                 <span>対立</span>
//               </div>
//             </div>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// };