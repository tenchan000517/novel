import React from 'react';

interface ChartData {
  [key: string]: any;
}

interface LineChartProps {
  data: ChartData[];
  xKey: string;
  yKey: string;
  color?: string;
  height?: number;
}

interface BarChartProps {
  data: ChartData[];
  xKey: string;
  yKey: string;
  color?: string;
  height?: number;
}

/**
 * シンプルな折れ線グラフコンポーネント
 */
export const LineChart: React.FC<LineChartProps> = ({ 
  data, 
  xKey, 
  yKey, 
  color = '#3B82F6', 
  height = 200 
}) => {
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500">データがありません</div>;
  }
  
  // データの最小値と最大値を計算
  const values = data.map(item => item[yKey] as number);
  const min = Math.min(0, ...values);
  const max = Math.max(...values);
  const range = max - min;
  
  // SVG内の座標に変換
  const getX = (index: number) => (index / (data.length - 1)) * 100 + '%';
  const getY = (value: number) => ((max - value) / (range || 1)) * 85 + 10 + '%';
  
  // path要素のd属性を作成
  const pathD = data.map((item, i) => {
    const x = getX(i);
    const y = getY(item[yKey] as number);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
  
  return (
    <div className="w-full h-full">
      <svg width="100%" height={height} viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* X軸 */}
        <line x1="0" y1="95%" x2="100%" y2="95%" stroke="#e5e7eb" strokeWidth="0.5" />
        
        {/* Y軸 */}
        <line x1="0" y1="10%" x2="0" y2="95%" stroke="#e5e7eb" strokeWidth="0.5" />
        
        {/* グラフの線 */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" />
        
        {/* データポイント */}
        {data.map((item, i) => (
          <circle
            key={i}
            cx={getX(i)}
            cy={getY(item[yKey] as number)}
            r="1.5"
            fill={color}
          />
        ))}
      </svg>
    </div>
  );
};

/**
 * シンプルな棒グラフコンポーネント
 */
export const BarChart: React.FC<BarChartProps> = ({ 
  data, 
  xKey, 
  yKey, 
  color = '#10B981', 
  height = 200 
}) => {
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500">データがありません</div>;
  }
  
  // データの最大値を計算
  const max = Math.max(...data.map(item => item[yKey] as number));
  
  // バーの幅を計算
  const barWidth = 100 / data.length - 2;
  
  return (
    <div className="w-full h-full">
      <svg width="100%" height={height} viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* X軸 */}
        <line x1="0" y1="95%" x2="100%" y2="95%" stroke="#e5e7eb" strokeWidth="0.5" />
        
        {/* バー */}
        {data.map((item, i) => {
          const x = (i * (barWidth + 2)) + 1;
          const value = item[yKey] as number;
          const barHeight = (value / max) * 85;
          
          return (
            <g key={i}>
              <rect
                x={`${x}%`}
                y={`${95 - barHeight}%`}
                width={`${barWidth}%`}
                height={`${barHeight}%`}
                fill={color}
                rx="1"
                ry="1"
              />
              <text
                x={`${x + barWidth/2}%`}
                y="98%"
                fontSize="3"
                textAnchor="middle"
                fill="#6b7280"
              >
                {item[xKey].toString().substring(0, 3)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/**
 * シンプルな円グラフコンポーネント
 */
interface PieChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
}

export const PieChart: React.FC<PieChartProps> = ({ data, height = 200 }) => {
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500">データがありません</div>;
  }
  
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const defaultColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  
  let currentAngle = 0;
  
  return (
    <div className="w-full h-full">
      <svg width="100%" height={height} viewBox="0 0 100 100">
        <g transform="translate(50, 50)">
          {data.map((item, i) => {
            const angle = (item.value / total) * 360;
            const startAngle = currentAngle;
            currentAngle += angle;
            const endAngle = currentAngle;
            
            const startRad = (startAngle - 90) * Math.PI / 180;
            const endRad = (endAngle - 90) * Math.PI / 180;
            
            const x1 = 40 * Math.cos(startRad);
            const y1 = 40 * Math.sin(startRad);
            const x2 = 40 * Math.cos(endRad);
            const y2 = 40 * Math.sin(endRad);
            
            const largeArc = angle > 180 ? 1 : 0;
            
            const pathD = `M 0 0 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;
            
            return (
              <path
                key={i}
                d={pathD}
                fill={item.color || defaultColors[i % defaultColors.length]}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
};

/**
 * シンプルなエリアチャートコンポーネント
 */
interface AreaChartProps {
  data: ChartData[];
  xKey: string;
  yKey: string;
  color?: string;
  fillOpacity?: number;
  height?: number;
}

export const AreaChart: React.FC<AreaChartProps> = ({ 
  data, 
  xKey, 
  yKey, 
  color = '#3B82F6', 
  fillOpacity = 0.2,
  height = 200 
}) => {
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500">データがありません</div>;
  }
  
  // データの最小値と最大値を計算
  const values = data.map(item => item[yKey] as number);
  const min = Math.min(0, ...values);
  const max = Math.max(...values);
  const range = max - min;
  
  // SVG内の座標に変換
  const getX = (index: number) => (index / (data.length - 1)) * 100 + '%';
  const getY = (value: number) => ((max - value) / (range || 1)) * 85 + 10 + '%';
  
  // path要素のd属性を作成
  const linePath = data.map((item, i) => {
    const x = getX(i);
    const y = getY(item[yKey] as number);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
  
  // 塗りつぶし領域のパスを作成
  const areaPath = linePath + 
    ` L ${getX(data.length - 1)} 95% L 0 95% Z`;
  
  return (
    <div className="w-full h-full">
      <svg width="100%" height={height} viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* X軸 */}
        <line x1="0" y1="95%" x2="100%" y2="95%" stroke="#e5e7eb" strokeWidth="0.5" />
        
        {/* Y軸 */}
        <line x1="0" y1="10%" x2="0" y2="95%" stroke="#e5e7eb" strokeWidth="0.5" />
        
        {/* 塗りつぶし領域 */}
        <path d={areaPath} fill={color} fillOpacity={fillOpacity} />
        
        {/* グラフの線 */}
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" />
        
        {/* データポイント */}
        {data.map((item, i) => (
          <circle
            key={i}
            cx={getX(i)}
            cy={getY(item[yKey] as number)}
            r="1.5"
            fill={color}
          />
        ))}
      </svg>
    </div>
  );
};